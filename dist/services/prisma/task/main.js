"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTaskById = exports.fetchPendingTasks = exports.saveTask = void 0;
const main_1 = require("../main");
const saveTask = async (userId, data) => {
    const { taskType, description, modelDetails, trainingData, trainingParameters, } = data;
    let aiModel = await main_1.prisma.aIModel.findUnique({
        where: { id: modelDetails.modelId },
    });
    if (!aiModel) {
        aiModel = await main_1.prisma.aIModel.create({
            data: {
                modelName: modelDetails.modelName,
                type: modelDetails.modelType,
                url: modelDetails.pretrainedModelUrl,
                configUrl: modelDetails.configUrl,
                otherUrl: modelDetails.otherUrl,
                framework: modelDetails.framework,
                version: '1.0',
                userId: userId,
            },
        });
    }
    const task = await main_1.prisma.task.create({
        data: {
            title: description,
            description: description,
            taskType: taskType,
            status: 'PENDING',
            user: {
                connect: { id: userId },
            },
            aiModel: {
                connect: { id: aiModel.id },
            },
            trainingData: trainingData,
            trainingParameters: trainingParameters,
        },
    });
    return { task, aiModel };
};
exports.saveTask = saveTask;
const fetchPendingTasks = async () => {
    return await main_1.prisma.task.findMany({
        where: {
            status: 'PENDING',
        }
    });
};
exports.fetchPendingTasks = fetchPendingTasks;
const fetchTaskById = async (taskId) => {
    return await main_1.prisma.task.findFirst({
        where: {
            id: taskId,
        },
        include: {
            aiModel: true
        }
    });
};
exports.fetchTaskById = fetchTaskById;
