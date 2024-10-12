"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePricePair = void 0;
const main_1 = require("../main");
const axios = require('axios');
const updatePricePair = async () => {
    // Retrieve the current record from the database
    const existingPair = await main_1.prisma.pricePair.findUnique({
        where: {
            pair_currency: { pair: 'eth', currency: 'usd' }
        }
    });
    if (!existingPair) {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`);
        const newPrice = response.data.ethereum.usd;
        const createdPair = await main_1.prisma.pricePair.create({
            data: {
                pair: 'eth',
                currency: 'usd',
                price: newPrice,
            }
        });
        console.log('Price pair created');
        return createdPair;
    }
    else {
        const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);
        if (new Date(existingPair.updatedAt) < oneHourAgo) {
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`);
            const updatedPrice = response.data.ethereum.usd;
            const updatedPair = await main_1.prisma.pricePair.update({
                where: {
                    pair_currency: { pair: 'eth', currency: 'usd' }
                },
                data: {
                    price: updatedPrice,
                }
            });
            return updatedPair;
        }
        else {
            return existingPair;
        }
    }
};
exports.updatePricePair = updatePricePair;
