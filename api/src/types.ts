import { ObjectId } from "mongodb";

export enum Han {
	Mangan_at_Draw = 0,
	Fully_Concealed_Hand = 1,
	Riichi = 2,
	Robbing_a_Kan = 3,
	After_a_Kan = 4,
	Under_the_Sea = 5,
	Under_the_River = 6,
	White_Dragon = 7,
	Green_Dragon = 8,
	Red_Dragon = 9,
	Seat_Wind = 10,
	Prevalent_Wind = 11,
	All_Simples = 12,
	Pure_Double_Sequence = 13,
	Pinfu = 14,
	Half_Outside_Hand = 15,
	Pure_Straight = 16,
	Mixed_Triple_Sequence = 17,
	Double_Riichi = 18,
	Triple_Triplets = 19,
	Three_Quads = 20,
	All_Triplets = 21,
	Three_Concealed_Triplets = 22,
	Little_Three_Dragons = 23,
	All_Terminals_and_Honors = 24,
	Seven_Pairs = 25,
	Fully_Outside_Hand = 26,
	Half_Flush = 27,
	Twice_Pure_Double_Sequence = 28,
	Full_Flush = 29,
	Ippatsu = 30,
	Dora = 31,
	Red_Five = 32,
	Ura_Dora = 33,
	Kita = 34,
	Blessing_of_Heaven = 35,
	Blessing_of_Earth = 36,
	Big_Three_Dragons = 37,
	Four_Concealed_Triplets = 38,
	All_Honors = 39,
	All_Green = 40,
	All_Terminals = 41,
	Thirteen_Orphans = 42,
	Four_Little_Winds = 43,
	Four_Quads = 44,
	Nine_Gates = 45,
	Eight_time_East_Staying = 46,
	True_Nine_Gates = 47,
	Single_wait_Four_Concealed_Triplets = 48,
	Thirteen_wait_Thirteen_Orphans = 49,
	Four_Big_Winds = 50,
	Tsubame_gaeshi = 51,
	Kanburi = 52,
	Shiiaruraotai = 53,
	Uumensai = 54,
	Three_Chained_Triplets = 55,
	Pure_Triple_Chow = 56,
	Iipinmoyue = 57,
	Chuupinraoyui = 58,
	Hand_of_Man = 59,
	Big_Wheels = 60,
	Bamboo_Forest = 61,
	Numerous_Neighbours = 62,
	Ishinouenimosannen = 63,
	Big_Seven_Stars = 64,
}

export interface IFinalScore {
	uma: number;
	score: number;
}

export interface IContestTeam {
	name: string;
	id: ObjectId;
	players: IPlayer[];
}

export interface IPlayer {
	_id: ObjectId;
	majsoulId: number;
	nickname: string;
	displayName: string;
}

export interface IMatch {
	teams: IContestTeam[];
}

export interface ISession {
	scheduledTime: number;
	plannedMatches: IMatch[];
	isCancelled: boolean;
	games: IGameResult[];
}

export interface IContest {
	majsoulId: number;
	contestId: number;
	sessions: ISession[];
	name: string;
	teams: IContestTeam[];
}

export interface IGameResult {
	id: ObjectId;
	contestId: number;
	majsoulId: string;
	start_time: number;
	end_time: number;
	players: IPlayer[];
	finalScore: IFinalScore[];
	rounds: IRoundResult[];
}

export enum Wind {
	East = 0,
	South,
	West,
	North,
}

export enum DrawStatus {
	Noten,
	Tenpai,
	Nagashi_Mangan,
}

interface IDrawRecord {
	playerDrawStatus: DrawStatus[];
}

export interface IAgariInfo {
	extras: number;
	winner: number;
	value: number;
	han: Han[];
}

interface ITsumoRecord extends IAgariInfo {
	dealerValue: number;
}

interface IRonRecord extends IAgariInfo {
	loser: number;
}

export interface IRoundInfo {
	round: Wind;
	dealership: Wind;
	repeat: number;
}

export interface IRoundResult {
	round: IRoundInfo;
	draw?: IDrawRecord;
	tsumo?: ITsumoRecord;
	rons?: IRonRecord[];
}
