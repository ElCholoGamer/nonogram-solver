import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import getConfig from 'next/config';
import { Fragment, useState } from 'react';
import classNames from 'classnames';
import Button from '../components/Button';
import HintInput from '../components/HintInput';
import SizeInput from '../components/SizeInput';

const enum Tile {
	UNKNOWN,
	WHITE,
	BLACK,
}

const enum ResultStatus {
	SOLVED,
	ERROR,
}

const config = getConfig();

const Home: NextPage = () => {
	const [width, setWidth] = useState(5);
	const [height, setHeight] = useState(5);
	const [grid, setGrid] = useState<Tile[][] | null>(null);
	const [rowHints, setRowHints] = useState<number[][]>([]);
	const [colHints, setColHints] = useState<number[][]>([]);
	const [status, setStatus] = useState<ResultStatus | null>(null);
	console.log(config);

	const createGrid = () => {
		setGrid([...Array(width)].map(() => Array(height).fill(Tile.UNKNOWN)));
		setRowHints([...Array(height)].map(() => []));
		setColHints([...Array(width)].map(() => []));
	};

	const restart = () => {
		setGrid(null);
	};

	const addRowHint = (index: number, value: number) => {
		if (rowHints[index].length >= maxHintsX) return;
		setRowHints(
			rowHints =>
				rowHints?.map((row, i) => {
					if (i === index) return [value, ...row];
					return row;
				}) ?? null
		);
	};

	const addColHint = (index: number, value: number) => {
		if (colHints[index].length >= maxHintsY) return;

		setColHints(
			colHints =>
				colHints?.map((col, i) => {
					if (i === index) return [value, ...col];
					return col;
				}) ?? null
		);
	};

	const deleteRowHint = (rowY: number, index: number) => {
		setRowHints(rowHints =>
			rowHints?.map((row, y) => {
				if (y === rowY) return row.filter((_, hintIndex) => hintIndex !== index);
				return row;
			})
		);
	};

	const deleteColHint = (colX: number, index: number) => {
		setColHints(colHints =>
			colHints?.map((col, x) => {
				if (x === colX) return col.filter((_, hintIndex) => hintIndex !== index);
				return col;
			})
		);
	};

	function findPermutations(hints: number[], dimensionLength: number) {
		function _findPermutations(
			currentValues: boolean[],
			from: number,
			hintIndex: number
		): boolean[][] {
			if (hintIndex < 0) {
				return [currentValues];
			}

			const out: boolean[][] = [];

			const hintLength = hints[hintIndex];
			const spaceThatLeftHintsNeed =
				hints.slice(0, hintIndex).reduce((a, b) => a + b, 0) + hintIndex;
			const until = dimensionLength - spaceThatLeftHintsNeed - hintLength + 1;

			for (let pos = from; pos < until; pos++) {
				const newPermutation = [...currentValues];
				for (let i = 0; i < hintLength; i++) {
					newPermutation[pos + i] = true;
				}

				out.push(..._findPermutations(newPermutation, pos + hintLength + 1, hintIndex - 1));
			}

			return out;
		}

		return _findPermutations(Array(dimensionLength).fill(false), 0, hints.length - 1);
	}

	const solve = () => {
		const rowPermutations = rowHints.map(hints => findPermutations(hints, width));
		const colPermutations = colHints.map(hints => findPermutations(hints, height));

		let grid = [...Array(width)].map(() => Array(height).fill(Tile.UNKNOWN));

		while (true) {
			let finished = true;

			for (let y = 0; y < height; y++) {
				const permutations = rowPermutations[y];
				if (permutations.length === 0) continue;

				for (let x = 0; x < width; x++) {
					if (grid[x][y] !== Tile.UNKNOWN) continue;

					const testValue = permutations[0][x];
					if (permutations.some(p => p[x] !== testValue)) continue;

					grid[x][y] = testValue ? Tile.BLACK : Tile.WHITE;
					colPermutations[x] = colPermutations[x].filter(p => p[y] === testValue);
					finished = false;
				}
			}

			for (let x = 0; x < width; x++) {
				const permutations = colPermutations[x];
				if (permutations.length === 0) continue;

				for (let y = 0; y < height; y++) {
					if (grid[x][y] !== Tile.UNKNOWN) continue;

					const testValue = permutations[0][y];
					if (permutations.some(p => p[y] !== testValue)) continue;

					grid[x][y] = testValue ? Tile.BLACK : Tile.WHITE;
					rowPermutations[y] = rowPermutations[y].filter(p => p[x] === testValue);
					console.log('what');
					finished = false;
				}
			}

			if (finished) break;
		}

		if (grid.every(column => !column.includes(Tile.UNKNOWN))) {
			grid = grid.map(column => column.map(tile => (tile === Tile.WHITE ? Tile.UNKNOWN : tile)));
			setStatus(ResultStatus.SOLVED);
		} else {
			setStatus(ResultStatus.ERROR);
		}

		setGrid(grid.map(column => [...column]));
	};

	const clearGrid = () => {
		setStatus(null);
		setGrid(grid => grid?.map(col => Array(col.length).fill(Tile.UNKNOWN)) ?? null);
	};

	const clearAll = () => {
		setRowHints(rowHints => rowHints.map(() => []));
		setColHints(colHints => colHints.map(() => []));
		clearGrid();
	};

	const maxHintsX = Math.ceil(width / 2);
	const maxHintsY = Math.ceil(height / 2);

	return (
		<div className="flex flex-col h-full">
			<Head>
				<title>Nonogram Solver</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href={`${process.env.NEXT_PUBLIC_ASSET_PREFIX || '/'}favicon.ico`} />
			</Head>

			<main className="p-12 flex-grow">
				<h1 className="text-4xl font-semibold">Nonogram Solver</h1>
				<p className="my-3">By ElCholoGamer</p>

				{!grid ? (
					<>
						<h2 className=" mt-20 mb-10 text-2xl">Choose a grid size:</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto mb-12">
							<SizeInput label="Width" value={width} setValue={setWidth} />
							<SizeInput label="Height" value={height} setValue={setHeight} />
						</div>
						<Button onClick={createGrid}>Create grid</Button>
					</>
				) : (
					<div className="mt-16 mb-4">
						{status === null ? (
							<p className="text-gray-600">
								Fill in the inputs and click on &quot;Solve&quot; when you&apos;re ready
							</p>
						) : status === ResultStatus.SOLVED ? (
							<p className="text-green-300">Nonogram solved!</p>
						) : (
							<p className="text-red-400">Couldn&apos;t solve the nonogram :(</p>
						)}
						<br />
						<div
							className="inline-grid grid-flow-col"
							style={{ gridTemplateRows: `repeat(${height + maxHintsY + 1}, minmax(0, 1fr))` }}
						>
							{/* Filling */}
							{[...Array(maxHintsY + 1)].map((_, i) => (
								<div
									key={i}
									className={classNames(
										'bg-white border-l-2 border-neutral-900',
										i === 0 && 'border-t-2'
									)}
								></div>
							))}
							{/* Left side inputs and hints */}
							{[...Array(height)].map((_, y) => (
								<div key={y} className="flex">
									<HintInput
										disabled={rowHints[y].length >= maxHintsX}
										onAdd={n => addRowHint(y, n)}
										className={classNames(
											'h-6 sm:h-8 w-6 sm:w-8 border-l-2',
											y % 5 === 4 ? 'border-b-2' : 'border-b',
											y === 0 && 'border-t-2'
										)}
									/>
									{[...Array(maxHintsX)].map((_, x) => {
										const rowHintIndex = maxHintsX - x - 1;
										return (
											<div
												key={x}
												className={classNames(
													'h-6 sm:h-8 bg-white  border-neutral-900 w-6 sm:w-8 text-neutral-900',
													y % 5 === 4 ? 'border-b-2' : 'border-b',
													y === 0 && 'border-t-2',
													x === 0 && 'border-l-2'
												)}
											>
												{rowHintIndex < rowHints[y].length && (
													<div
														className={
															'rounded-md transition-all hover:bg-red-300 h-full flex items-center justify-center cursor-pointer'
														}
														onClick={() => deleteRowHint(y, rowHintIndex)}
													>
														{rowHints[y][maxHintsX - x - 1]}
													</div>
												)}
											</div>
										);
									})}
								</div>
							))}
							{grid.map((column, x) => (
								<Fragment key={x}>
									{/* Column top input */}
									<HintInput
										onAdd={n => addColHint(x, n)}
										disabled={colHints[x].length >= maxHintsY}
										className={classNames(
											'h-6 sm:h-8 w-6 sm:w-8 border-t-2',
											x % 5 === 4 ? 'border-r-2' : 'border-r',
											x === 0 && 'border-l-2'
										)}
									/>
									{/* Column hints */}
									{[...Array(maxHintsY)].map((_, hintY) => {
										const colHintIndex = maxHintsY - hintY - 1;

										return (
											<div
												key={hintY}
												className={classNames(
													'bg-white border-neutral-900 text-neutral-900',
													x % 5 === 4 ? 'border-r-2' : 'border-r',
													x === 0 && 'border-l-2',
													hintY === 0 && 'border-t-2'
												)}
											>
												{colHintIndex < colHints[x].length && (
													<div
														className={
															'rounded-md transition-all hover:bg-red-300 h-full flex items-center justify-center cursor-pointer'
														}
														onClick={() => deleteColHint(x, colHintIndex)}
													>
														{colHints[x][colHintIndex]}
													</div>
												)}
											</div>
										);
									})}
									{/* Squares */}
									{column.map((tile, y) => (
										<div
											key={`${x},${y}`}
											className={classNames(
												'h-6 sm:h-8 border-neutral-900 text-neutral-900 text-md sm:text-xl',
												x % 5 === 4 ? 'border-r-2' : 'border-r',
												y % 5 === 4 ? 'border-b-2' : 'border-b',
												x === 0 && 'border-l-2',
												y === 0 && 'border-t-2',
												tile === Tile.BLACK ? 'bg-black' : 'bg-white'
											)}
										>
											{tile === Tile.WHITE && 'x'}
										</div>
									))}
								</Fragment>
							))}
						</div>
						<br />
						<Button onClick={solve} className="text-2xl my-6 text-yellow-300 hover:text-yellow-100">
							Solve
						</Button>
						<div className="my-4 flex justify-center flex-col sm:flex-row items-center">
							<Button className="m-2" onClick={clearGrid}>
								Clear grid
							</Button>
							<Button className="m-2" onClick={clearAll}>
								Clear all
							</Button>
						</div>
						<Button onClick={restart}>Choose another size</Button>
					</div>
				)}
			</main>
			<footer className="py-4 px-3">
				<small>
					<Link
						className="text-blue-500 hover:text-blue-300"
						href="https://en.wikipedia.org/wiki/Nonogram"
						target="_blank"
						rel="noopener noreferrer"
					>
						[What the heck is a nonogram?]
					</Link>
				</small>
			</footer>
		</div>
	);
};

export default Home;
