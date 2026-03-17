import { createOrderItemTable } from "../models/orderItemsTable.js";
import { createOrdersTable } from "../models/ordersTable.js";
import { createProductsTable } from "../models/productsTable.js";
import { createUsersTable } from "../models/usersTable.js";
import {  createProductReviewsTable } from "../models/productReviewsTable.js";
import { createShippingInfoTable } from "../models/shippinginfoTable.js";
import { createPaymentsTable } from "../models/paymentsTable.js";


export const createTables = async () => {
    try {
        await createUsersTable();
        await createProductsTable();
        await createOrdersTable();
        await createOrderItemTable();
        await createShippingInfoTable();
        await createPaymentsTable();
        await  createProductReviewsTable();
        
        
    } catch (error) {
        console.error('Failed To Create Tables.', error);
        process.exit(1);
        
    }
}