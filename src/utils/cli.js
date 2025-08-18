#!/usr/bin/env node
import { program } from "commander";
import fs from "fs-extra";
import path from "path";
import { __dirname, __filename } from "./path.js";
import capitalize from "capitalize";

program
	.command("make:domain <name>")
	.description(
		"Generate a new domain folder with controller, service, routes, and schema",
	)
	.action((name) => {
		const domainParts = name.split("/");
		const domainPath = path.join(__filename, "/src/domains", ...domainParts);

		console.log(`📂 Generating domain at: ${domainPath}`);

		if (fs.existsSync(domainPath)) {
			console.error(`❌ Domain ${name} already exists!`);
			process.exit(1);
		}

		fs.ensureDirSync(domainPath);
		name = domainParts[domainParts.length - 1];

		// Template file
		const controllerTemplate = `class ${capitalize(name)}Controller {

    async index() {
        throw new Error("Method not implemented");
    }

    async show() {
        throw new Error("Method not implemented");
    }

    async create() {
        throw new Error("Method not implemented");
    }

    async update() {
        throw new Error("Method not implemented");
    }

    async delete() {
        throw new Error("Method not implemented");
    }
}

export default new ${capitalize(name)}Controller();`;

		const serviceTemplate = `class ${capitalize(name)}Service {
    async someMethod() {
        throw new Error("Method not implemented");
    }
}

export default new ${capitalize(name)}Service();`;

		const routesTemplate = `import BaseRoutes from "../../base_classes/base-routes.js";
import ${capitalize(name)}Controller from "./${name}-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class ${capitalize(name)}Routes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(${capitalize(name)}Controller.index)]);
        this.router.get("/:id", [tryCatch(${capitalize(name)}Controller.show)]);
        this.router.post("/", [tryCatch(${capitalize(name)}Controller.create)]);
        this.router.put("/:id", [tryCatch(${capitalize(name)}Controller.update)]);
        this.router.delete("/:id", [tryCatch(${capitalize(name)}Controller.delete)]);
    }
}

export default new ${capitalize(name)}Routes().router;`;

		const schemaTemplate = `import Joi from "joi";

const ${name}Schema = Joi.object({
    // Define your validation schema here
});

export { ${name}Schema };`;

		// Buat file di folder domain
		fs.writeFileSync(
			path.join(domainPath, `${name}-controller.js`),
			controllerTemplate,
			"utf8",
		);
		fs.writeFileSync(
			path.join(domainPath, `${name}-service.js`),
			serviceTemplate,
			"utf8",
		);
		fs.writeFileSync(
			path.join(domainPath, `${name}-routes.js`),
			routesTemplate,
			"utf8",
		);
		fs.writeFileSync(
			path.join(domainPath, `${name}-schema.js`),
			schemaTemplate,
			"utf8",
		);

		console.log(`✅ Domain '${name}' created successfully!`);
	});

program.parse(process.argv);
