import noImage from "../assets/imgs/no-image.jpg"
import { useEventAssistant } from "../hooks/useEventAssistant";
import Pin from "../interfaces/Pin";

interface AssistantsDisplayProps {
  assistants: string[];
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
	thisUser: string | null;
	p: Pin;
}

const AssistantsDisplay = ({assistants, setPins, thisUser, p}: AssistantsDisplayProps) => {
  const { addAssistant } = useEventAssistant(setPins);
	const maxDisplay = 3;
	const displayCount = assistants.length;
 
	return ( // If not thisUser && typescript cries :(, as thisUser could be null
		<div onClick={() => thisUser && addAssistant(p, thisUser)} className="flex -space-x-4 rtl:space-x-reverse my-1 ms-3 justify-start"> 
			{assistants.slice(0, maxDisplay).map((username) => (
				<img 
					key={username} 
					className="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800" 
					src={noImage} // esto ha de llamar al useProfileUrlnoseke cada vez PARA TENER LA IMAGEN DE CADA USUARIO
					alt={username} 
				/>
			))}
				<a className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800">
					{displayCount}
				</a>
		</div>
	);
 };

 export default  AssistantsDisplay;