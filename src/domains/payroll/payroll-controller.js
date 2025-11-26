class PayrollController {

    async create() {
        const result = await payrollService.create(req.body);
        return createdResponse(res, result);
    }
    
    async list() {
        const query = req.query;
        const result = await payrollService.list({ query });

        return successResponse(
            res,
            result.data,
            "Payroll retrived successfully",
            result.meta
        );
    }
    
    async detail() {
        const result = await payrollService.detail(req.params.id);
        return successResponse(res, result);
    }
    
    async update() {
        const result = await payrollService.update(
            req.payroll,
            req.params.id,
            req.body
        );
        return successResponse(res, result);
    }

    async delete() {
        const result = await payrollService.remove(req.params.id);
        return successResponse(res, result);
    }
}

export default new PayrollController();