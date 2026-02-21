export type FoodCategory = "Breakfast" | "Lunch" | "Snacks" | "Dinner";

export interface FoodItem {
    id: string;
    name: string;
    servingSize: string;
    calories: number;
    category: FoodCategory;
}

export const FOOD_DATABASE: FoodItem[] = [
    // Breakfast
    { id: "bf_1", name: "Poha", servingSize: "1 Cup", calories: 270, category: "Breakfast" },
    { id: "bf_2", name: "Masala Dosa", servingSize: "1 Medium", calories: 387, category: "Breakfast" },
    { id: "bf_3", name: "Idli", servingSize: "2 Pieces", calories: 130, category: "Breakfast" },
    { id: "bf_4", name: "Medu Vada", servingSize: "1 Piece", calories: 100, category: "Breakfast" },
    { id: "bf_5", name: "Upma (Rava)", servingSize: "1 Cup", calories: 180, category: "Breakfast" },
    { id: "bf_6", name: "Boiled Egg", servingSize: "1 Large Egg", calories: 78, category: "Breakfast" },
    { id: "bf_7", name: "Oats", servingSize: "1 Cup (Cooked)", calories: 147, category: "Breakfast" },
    { id: "bf_8", name: "Besan Chilla", servingSize: "2 Pieces", calories: 220, category: "Breakfast" },
    { id: "bf_9", name: "Mix Paratha", servingSize: "1 Paratha", calories: 200, category: "Breakfast" },
    { id: "bf_10", name: "Paneer Bhurji", servingSize: "1 Bowl", calories: 275, category: "Breakfast" },
    { id: "bf_11", name: "Egg McMuffin", servingSize: "1 Sandwich", calories: 310, category: "Breakfast" },
    { id: "bf_12", name: "Fruit and Maple Oatmeal", servingSize: "1 Bowl", calories: 320, category: "Breakfast" },
    { id: "bf_13", name: "Avocado Toast", servingSize: "1 Portion", calories: 190, category: "Breakfast" },
    { id: "bf_14", name: "Bacon and Eggs", servingSize: "1 Portion", calories: 135, category: "Breakfast" },
    { id: "bf_15", name: "Banana", servingSize: "1 Medium", calories: 105, category: "Breakfast" },
    { id: "bf_16", name: "Apple", servingSize: "1 Medium", calories: 95, category: "Breakfast" },
    { id: "bf_17", name: "Plain Tea (Sugarless)", servingSize: "1 Cup (240 ml)", calories: 2, category: "Breakfast" },
    { id: "bf_18", name: "Milk Coffee (Sugarless)", servingSize: "1 Cup (Semi-skimmed)", calories: 20, category: "Breakfast" },
    { id: "bf_19", name: "Plain Milk (Sugarless)", servingSize: "1 Cup (Whole Milk)", calories: 150, category: "Breakfast" },
    { id: "bf_20", name: "Black Coffee (Sugarless)", servingSize: "1 Cup (8 oz)", calories: 3, category: "Breakfast" },

    // Lunch
    { id: "lu_1", name: "Rajma Chawal", servingSize: "1 Plate", calories: 450, category: "Lunch" },
    { id: "lu_2", name: "Chole Bhature", servingSize: "1 Plate", calories: 450, category: "Lunch" },
    { id: "lu_3", name: "Paneer Tikka Masala", servingSize: "1 Bowl", calories: 300, category: "Lunch" },
    { id: "lu_4", name: "Dal Makhani", servingSize: "1 Bowl", calories: 325, category: "Lunch" },
    { id: "lu_5", name: "Chapati / Wheat Roti", servingSize: "1 Medium", calories: 100, category: "Lunch" },
    { id: "lu_6", name: "Steamed Rice (White)", servingSize: "1 Cup", calories: 205, category: "Lunch" },
    { id: "lu_7", name: "Jeera / Ghee Rice", servingSize: "1 Cup", calories: 350, category: "Lunch" },
    { id: "lu_8", name: "Dal Tadka", servingSize: "1 Bowl", calories: 150, category: "Lunch" },
    { id: "lu_9", name: "Veg Biryani", servingSize: "1 Cup", calories: 350, category: "Lunch" },
    { id: "lu_10", name: "Butter Chicken", servingSize: "1 Cup", calories: 350, category: "Lunch" },
    { id: "lu_11", name: "Cheeseburger", servingSize: "1 Sandwich", calories: 300, category: "Lunch" },
    { id: "lu_12", name: "Quarter Pounder with Cheese", servingSize: "1 Sandwich", calories: 520, category: "Lunch" },
    { id: "lu_13", name: "Chicken McNuggets", servingSize: "6 Pieces", calories: 250, category: "Lunch" },
    { id: "lu_14", name: "Subway Veggie Delite", servingSize: "6-inch Sub", calories: 200, category: "Lunch" },
    { id: "lu_15", name: "Caesar Salad with Grilled Chicken", servingSize: "1 Portion (10 oz)", calories: 352, category: "Lunch" },
    { id: "lu_16", name: "Chicken Fried Rice", servingSize: "1 Portion (8.8 oz)", calories: 433, category: "Lunch" },
    { id: "lu_17", name: "Burrito Bowl (Chicken, No Rice)", servingSize: "1 Bowl", calories: 580, category: "Lunch" },
    { id: "lu_18", name: "Buttermilk (Chaas)", servingSize: "1 Glass", calories: 56, category: "Lunch" },
    { id: "lu_19", name: "Kokum Sharbat / Lime Water", servingSize: "1 Glass", calories: 60, category: "Lunch" },

    // Snacks
    { id: "sn_1", name: "Samosa", servingSize: "1 Medium Piece", calories: 275, category: "Snacks" },
    { id: "sn_2", name: "Pav Bhaji", servingSize: "1 Plate", calories: 350, category: "Snacks" },
    { id: "sn_3", name: "Pani Puri", servingSize: "6 Puris", calories: 175, category: "Snacks" },
    { id: "sn_4", name: "Aloo Tikki", servingSize: "1 Tikki", calories: 60, category: "Snacks" },
    { id: "sn_5", name: "Dabeli", servingSize: "1 Piece", calories: 250, category: "Snacks" },
    { id: "sn_6", name: "Onion Pakoda", servingSize: "1 Plate", calories: 225, category: "Snacks" },
    { id: "sn_7", name: "Maggi Noodles", servingSize: "1 Small Bowl", calories: 300, category: "Snacks" },
    { id: "sn_8", name: "Coleslaw Sandwich", servingSize: "1 Sandwich", calories: 250, category: "Snacks" },
    { id: "sn_9", name: "French Fries", servingSize: "1 Small Order", calories: 320, category: "Snacks" },
    { id: "sn_10", name: "Mozzarella Sticks", servingSize: "4 Sticks", calories: 330, category: "Snacks" },
    { id: "sn_11", name: "Chicken Soft Taco", servingSize: "1 Taco", calories: 160, category: "Snacks" },
    { id: "sn_12", name: "Oatcakes", servingSize: "2 Pieces", calories: 100, category: "Snacks" },
    { id: "sn_13", name: "Grapes", servingSize: "1 Cup", calories: 62, category: "Snacks" },
    { id: "sn_14", name: "Orange", servingSize: "1 Medium", calories: 62, category: "Snacks" },
    { id: "sn_15", name: "Plain Tea (Sugarless)", servingSize: "1 Cup (240 ml)", calories: 110, category: "Snacks" },
    { id: "sn_16", name: "Hot Bournvita", servingSize: "1 Cup", calories: 90, category: "Snacks" },
    { id: "sn_17", name: "Sugarless Tea", servingSize: "1 Cup", calories: 2, category: "Snacks" },
    { id: "sn_18", name: "Sugarless Milk Coffee", servingSize: "1 Cup", calories: 20, category: "Snacks" },
    { id: "sn_19", name: "Plain Milk (Sugarless)", servingSize: "1 Cup (240 ml)", calories: 150, category: "Snacks" },

    // Dinner
    { id: "dn_1", name: "Chicken Dum Biryani", servingSize: "1 Cup", calories: 450, category: "Dinner" },
    { id: "dn_2", name: "Palak Paneer", servingSize: "1 Cup", calories: 225, category: "Dinner" },
    { id: "dn_3", name: "Bhindi Masala", servingSize: "1 Cup", calories: 125, category: "Dinner" },
    { id: "dn_4", name: "Chicken Curry", servingSize: "1 Cup", calories: 350, category: "Dinner" },
    { id: "dn_5", name: "Tandoori Roti", servingSize: "1 Roti", calories: 125, category: "Dinner" },
    { id: "dn_6", name: "Yellow Dal / Akka Masoor", servingSize: "1 Bowl", calories: 150, category: "Dinner" },
    { id: "dn_7", name: "Methi Murgh (Chicken)", servingSize: "1 Bowl", calories: 300, category: "Dinner" },
    { id: "dn_8", name: "Paneer Muttar", servingSize: "1 Bowl", calories: 250, category: "Dinner" },
    { id: "dn_9", name: "Sweet Corn Veg Soup", servingSize: "1 Bowl", calories: 100, category: "Dinner" },
    { id: "dn_10", name: "Rice Kheer / Payasam", servingSize: "1 Katori", calories: 110, category: "Dinner" },
    { id: "dn_11", name: "Gulab Jamun", servingSize: "2 Pieces", calories: 225, category: "Dinner" },
    { id: "dn_12", name: "Beef Noodle Soup", servingSize: "1 Large Portion", calories: 280, category: "Dinner" },
    { id: "dn_13", name: "Chicken Pot Pie", servingSize: "1 Small Piece", calories: 365, category: "Dinner" },
    { id: "dn_14", name: "Cheese Pizza (Thin Crust)", servingSize: "1/4 of Medium Pizza", calories: 150, category: "Dinner" },
    { id: "dn_15", name: "Cobb Salad", servingSize: "1 Portion (8.8 oz)", calories: 230, category: "Dinner" },
    { id: "dn_16", name: "Chicken Fajita", servingSize: "1 Piece (4.9 oz)", calories: 224, category: "Dinner" },
    { id: "dn_17", name: "Chilli con Carne", servingSize: "1 Can (14.3 oz)", calories: 405, category: "Dinner" },
    { id: "dn_18", name: "Baked Salmon", servingSize: "1 Fillet", calories: 350, category: "Dinner" },
    { id: "dn_19", name: "Roti", servingSize: "1 Roti", calories: 70, category: "Dinner" },
    { id: "dn_20", name: "Rice", servingSize: "1 Cup", calories: 205, category: "Dinner" },
];

export function getAllFoods(customFoods: FoodItem[]): FoodItem[] {
    return [...FOOD_DATABASE, ...customFoods];
}
