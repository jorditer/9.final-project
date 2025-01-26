import noImage from "../assets/imgs/no-image.jpg"

interface AssistantsDisplayProps {
  assistants: string[];
}

const AssistantsDisplay = ({assistants}: AssistantsDisplayProps) => {
	const maxDisplay = 3;
	const displayCount =assistants.length;
 
	return (
		<div className="flex -space-x-4 rtl:space-x-reverse my-1 ms-3 justify-start">
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