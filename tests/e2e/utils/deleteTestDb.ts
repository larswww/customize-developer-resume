import fs from "node:fs";

export default function deleteTestDb(name: string, path = "./db-data") {
	if (fs.existsSync(path)) {
		fs.unlinkSync(`${path}/${name}.db`);
		fs.unlinkSync(`${path}/${name}.db-shm`);
		fs.unlinkSync(`${path}/${name}.db-wal`);

		console.log(`Test database at ${name} deleted successfully.`);
	}
}
