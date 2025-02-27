import * as React from "react";
import { Store } from "majsoul-api";
import defaultImage from "../../assets/shamiko.jpg";
import { LoadingSpinner } from "./utils/LoadingSpinner";
import { css } from "astroturf";
import clsx from "clsx";

const styles = css`
	.container {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;

		height: 40px;
		width: 40px;
	}

	.image {
		max-width: 100%;
		max-height: 100%;
	}
`;

export function TeamImage(props: {
	team: Store.ContestTeam;
	className?: string;
	imageClassName?: string;
}) {
	if (props.team == null) {
		return null;
	}

	return <div
		className={clsx(styles.container, props.className)}
	>
		{props.team.image === undefined
			? <LoadingSpinner />
			: <img src={props.team.image ?? defaultImage} className={clsx(props.imageClassName, styles.image)} />
		}
	</div>;
}
