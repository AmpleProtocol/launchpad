import { FieldError } from "react-hook-form"
import { Text } from "theme-ui"

interface IProps {
	fieldError: FieldError | undefined
}
export const ErrorMessage: React.FC<IProps> = ({ fieldError }) => {
	return <>
		{fieldError && <Text sx={{ color: 'red' }}>{fieldError.message}</Text>}
	</>

}
