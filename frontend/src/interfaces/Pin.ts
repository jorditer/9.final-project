export default interface Pin {
	_id: string;
	username: string;
	title: string;
	description: string;
	location: string;
	happening: Date;
	price: number;
	lat: number;
	long: number;
	createdAt: Date;
	updatedAt: Date;
  }