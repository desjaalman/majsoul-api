import { ChangeEvent, ChangeStream, Collection, MongoClient, ObjectId } from "mongodb";
import { Contest, GameResult, Player, User, Session, Config, GameResultVersion, latestGameResultVersion } from "./types/types";
import { Observable, Subject } from "rxjs";

interface Migration {
	perform(store: Store): Promise<void>;
}

const migrations: Migration[] = [];
export class Store {
	public contestCollection: Collection<Contest<ObjectId>>;
	public gamesCollection: Collection<GameResult<ObjectId>>;
	public sessionsCollection: Collection<Session<ObjectId>>;
	public playersCollection: Collection<Player<ObjectId>>;
	public configCollection: Collection<Config<ObjectId>>;
	public userCollection: Collection<User<ObjectId>>;

	private readonly contestChangesSubject = new Subject<ChangeEvent<Contest<ObjectId>>>();
	private readonly configChangesSubject = new Subject<ChangeEvent<Config<ObjectId>>>();
	private readonly gameChangesSubject = new Subject<ChangeEvent<GameResult<ObjectId>>>();
	private readonly playerChangesSubject = new Subject<ChangeEvent<Player<ObjectId>>>();
	private contestStream: ChangeStream<Contest<ObjectId>>;
	private configStream: ChangeStream<Config<ObjectId>>;
	private gameStream: ChangeStream<GameResult<ObjectId>>;
	private playerStream: ChangeStream<GameResult<ObjectId>>;

	public get ContestChanges(): Observable<ChangeEvent<Contest<ObjectId>>> {
		return this.contestChangesSubject;
	}

	public get ConfigChanges(): Observable<ChangeEvent<Config<ObjectId>>> {
		return this.configChangesSubject;
	}

	public get GameChanges(): Observable<ChangeEvent<GameResult<ObjectId>>> {
		return this.gameChangesSubject;
	}

	public get PlayerChanges(): Observable<ChangeEvent<Player<ObjectId>>> {
		return this.playerChangesSubject;
	}

	public async init(username: string, password: string): Promise<void> {
		const url = `mongodb://${username}:${password}@${process.env.NODE_ENV === "production" ? 'majsoul_mongo' : 'localhost'}:27017/?authMechanism=SCRAM-SHA-256&authSource=admin`;
		const client = new MongoClient(url);
		await client.connect();

		console.log("Connected successfully to server");

		const majsoulDb = client.db('majsoul');
		this.contestCollection = await majsoulDb.createCollection("contests", {});
		this.gamesCollection = await majsoulDb.createCollection("games", {});
		this.sessionsCollection = await majsoulDb.createCollection("sessions", {});
		this.sessionsCollection.createIndex({ scheduledTime: -1 });
		this.playersCollection = await majsoulDb.createCollection("players", {});
		this.configCollection = await majsoulDb.createCollection("config", {});

		this.contestStream = this.contestCollection.watch().on("change", change => this.contestChangesSubject.next(change));
		this.configStream = this.configCollection.watch().on("change", change => this.configChangesSubject.next(change));
		this.gameStream = this.gamesCollection.watch().on("change", change => this.gameChangesSubject.next(change));
		this.playerStream = this.playersCollection.watch().on("change", change => this.playerChangesSubject.next(change));

		if ((await this.configCollection.countDocuments()) < 1) {
			this.configCollection.insertOne({});
		}

		const oauthDb = client.db('oauth');
		this.userCollection = await oauthDb.createCollection("users", {});
	}

	public async isGameRecorded(majsoulId: string): Promise<boolean> {
		return await this.gamesCollection.countDocuments(
			{
				majsoulId,
				version: {
					$gte: latestGameResultVersion,
				},
				$or: [
					{
						notFoundOnMajsoul: { $exists: true },
					},
					{
						contestMajsoulId: { $exists: true },
					}
				]
			},
			{ limit: 1 }
		) === 1;
	}

	public async recordGame(contestId: ObjectId, gameResult: GameResult): Promise<void> {
		console.log(`Recording game id ${gameResult.majsoulId}`);
		delete gameResult._id;
		const gameRecord: Omit<GameResult<ObjectId>, "_id"> = {
			...gameResult,
			contestId,
			notFoundOnMajsoul: false,
			players: (await Promise.all(gameResult.players
				.map(player =>
					player == null
						? Promise.resolve(null)
						: this.playersCollection.findOneAndUpdate(
							{ $or: [{ majsoulId: player.majsoulId }, { nickname: player.nickname }] },
							{ $set: { majsoulId: player.majsoulId, nickname: player.nickname } },
							{ upsert: true, returnOriginal: false, projection: { _id: true } }
						)
				)
			)).map(p => p?.value),
		};

		await this.gamesCollection.findOneAndUpdate(
			{
				majsoulId: gameResult.majsoulId
			},
			{
				$set: {
					...gameRecord,
				}
			},
			{
				upsert: true
			}
		);
	}

	public async migrate(): Promise<void> {
		for (const migration of migrations) {
			await migration.perform(this);
		}
	}
}
