import classNames from 'classnames';
import { ChangeEventHandler, ComponentProps, KeyboardEventHandler, useState } from 'react';

export interface Props extends ComponentProps<'input'> {
	onAdd(value: number): void;
}

const HintInput: React.FC<Props> = ({ onAdd, className, disabled, ...props }) => {
	const [value, setValue] = useState('');

	const onChange: ChangeEventHandler<HTMLInputElement> = e => {
		setValue(e.target.value.trim().replace(/\D/g, '').substring(0, 2));
	};

	const onKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
		if (e.key !== 'Enter' || value.length === 0) return;

		const numValue = parseInt(value);
		if (numValue < 1) return;

		onAdd(numValue);
		setValue('');
	};

	return (
		<input
			{...props}
			type="text"
			className={classNames(
				className,
				'text-center border-neutral-900 text-neutral-900 disabled:bg-neutral-300 transition-colors'
			)}
			placeholder={disabled ? '-' : '+'}
			disabled={disabled}
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
		/>
	);
};

export default HintInput;
