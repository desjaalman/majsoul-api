import * as React from "react";
import { IState } from "../State";
import { Store } from "majsoul-api";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Team } from "./Teams";
import { useSelector } from "react-redux";


export function Match(props: {match: Store.Match}): JSX.Element {
	const teams = useSelector((state: IState) => state.contest.teams);
	if (teams == null) {
		return;
	}
	return <Container className="bg-primary pt-2 rounded text-dark">
		{props.match.teams.map(team =>
			<Row key={team._id} className="pl-1 no-gutters">
				<Col className="mb-2 pl-0 pr-1">
					<Team team={teams[team._id]} score={100}></Team>
				</Col>
			</Row>
		)}
	</Container>;
}
