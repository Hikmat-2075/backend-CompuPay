import BaseError from "../../base_classes/base-error.js";

import joi from "joi";
import { PrismaService } from "../../common/services/prisma.service.js";

import logger from "../../utils/logger.js";

class EmployeeService {
    constructor() {
		this.prisma = new PrismaService();
	}

    async detail(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id } 
        });
        if (!employee) throw BaseError.notFound("Employee not found");
        return { data: employee };
    }

	async list({ query } = {}) {
		// const options = buildQueryOptions(branchQueryConfig, query);

		const [data] = await Promise.all([
			this.prisma.employee.findMany(),
			// this.prisma.branch.count({ where: options.where }),
		]);

		// const page = query?.pagination?.page ?? 1;
		// const limit = query?.pagination?.limit ?? 10;
		// const hasPagination = !!(query?.pagination && !query?.get_all);
		// const totalPages = hasPagination ? Math.ceil(count / limit) : 1;

		return {
			data,
			// meta: hasPagination
			// ? {
			// 	totalItems: count,
			// 	totalPages,
			// 	currentPage: Number(page),
			// 	itemsPerPage: Number(limit),
			// }
			// : null,
		};
	}

	async create(data) {
		const nipExist = await this.prisma.employee.findFirst({
			where: {
				nip: data.nip,
			},
		});

		if (nipExist) {
			let validation = "";
			let stack = [];

			validation +=  "Nip is already taken.";

			stack.push({
				message: "Nip is already taken.",
				path: ["nip"],
			});

			throw new joi.ValidationError(validation, stack)
		}
		const emailExist = await this.prisma.employee.findFirst({
			where: {
				email: data.email,
			},
		});

		if (emailExist) {
			let validation = "";
			let stack = [];
			
			validation += "Email already taken.";

			stack.push({
				message: "Email already taken.",
				path: ["email"],
			});

			throw new joi.ValidationError(validation, stack);
		}

		await this.prisma.$transaction(async (tx) => {

			const createdemployee = await tx.employee.create({
				data: data,
			});

			if (!createdemployee){
				throw Error("Failed to create employee");
			}
		});

		return {
            "message": "Employee created successfully"
        }

	}

async update(id, data) {
    let validation = "";
    let stack = [];
    const fail = (message, path) => {
        validation += (validation ? " " : "") + message;
        stack.push({ message, path: [path] });
    };

    return this.prisma.$transaction(async (tx) => {
        const current = await tx.employee.findUnique({ where: { id } });
        if (!current) throw BaseError.notFound("Employee not found");

        // Cek duplicate NIP kecuali dirinya sendiri
        if (data.nip && data.nip !== current.nip) {
            const dupNip = await tx.employee.findFirst({
                where: { nip: data.nip, NOT: { id } },
            });
            if (dupNip) {
                fail("NIP already exists", "nip");
                throw new joi.ValidationError(validation, stack);
            }
        }

        // Cek duplicate Email kecuali dirinya sendiri
        if (data.email && data.email !== current.email) {
            const dupEmail = await tx.employee.findFirst({
                where: { email: data.email, NOT: { id } },
            });
            if (dupEmail) {
                fail("Email already exists", "email");
                throw new joi.ValidationError(validation, stack);
            }
        }

        // Update langsung, mirip kode branch
        const updated = await tx.employee.update({
            where: { id },
            data,
        });

        return updated;
    });
}

    async delete(id) {
        const deleted = await this.prisma.employee.delete({
            where: { id } 
        });
        return { message: "Employee deleted successfully", data: deleted};
    }

}

export default new EmployeeService();