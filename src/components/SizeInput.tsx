import classNames from 'classnames';
import { Dispatch, HTMLProps, SetStateAction } from 'react';

const MIN_SIZE = 5;
const MAX_SIZE = 20;

export interface Props extends HTMLProps<HTMLDivElement> {
	label: string;
	value: number;
	setValue: Dispatch<SetStateAction<number>>;
}

const SizeInput: React.FC<Props> = ({ className, label, value, setValue, ...props }) => (
	<div className={classNames(className, 'my-2')} {...props}>
		<label htmlFor="width">{label}: </label>
		{value}
		<br />
		<div className="flex items-center justify-center text-gray-500 my-2">
			{MIN_SIZE}
			<input
				type="range"
				id="width"
				name="width"
				min={MIN_SIZE}
				max={MAX_SIZE}
				value={value}
				className="mx-3"
				onChange={e => setValue(parseInt(e.currentTarget.value))}
			/>
			{MAX_SIZE}
		</div>
	</div>
);

export default SizeInput;
