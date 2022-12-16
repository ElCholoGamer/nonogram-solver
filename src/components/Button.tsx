import { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

export type Props = ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<Props> = ({ className, children, ...props }) => (
	<button
		className={classNames(
			className,
			'text-blue-500 text-xl hover:text-blue-300 disabled:text-blue-900 disabled:cursor-not-allowed'
		)}
		{...props}
	>
		[{children}]
	</button>
);

export default Button;
