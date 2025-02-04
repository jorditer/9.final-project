export default interface Pin {
	_id: string;
	username: string;
	title: string;
	description: string;
	location: string;
	date: Date;
	lat: number;
	long: number;
	createdAt: Date;
	updatedAt: Date;
	assistants: string[];
  }