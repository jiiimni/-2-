let iceCreamFlavors = [
    { name: "Chocolate", type: "Chocolate", price: 2 },
    { name: "Strawberry", type: "Fruit", price: 1 },
    { name: "Vanilla", type: "Vanilla", price: 2 },
    { name: "Pistachio", type: "Nuts", price: 1.5 },
    { name: "Neapolitan", type: "Chocolate", price: 2},
    { name: "Mint Chip", type: "Chocolate", price: 1.5 },
    { name: "Raspberry", type: "Fruit", price: 1},
];

let transactions = [];

// 거래 추가
transactions.push({ scoops: ["Chocolate", "Vanilla", "Mint Chip"], total: 5.5 });
transactions.push({ scoops: ["Raspberry", "Strawberry"], total: 2 });
transactions.push({ scoops: ["Vanilla", "Vanilla"], total: 4 });

// 수익 계산
const total = transactions.reduce((acc, curr) => acc + curr.total, 0); 
console.log(`You've made ${total} $ today`); // You've made 11.5 $ today

// 각 맛의 판매량 계산
let flavorDistribution = transactions.reduce((acc, curr) => {
    curr.scoops.forEach(scoop => {
        if (!acc[scoop]) {
            acc[scoop] = 0;
        }
        acc[scoop]++;
    });
    return acc;
}, {}); // { Chocolate: 1, Vanilla: 3, Mint Chip: 1, Raspberry: 1, Strawberry: 1 }

console.log(flavorDistribution);

// 가장 많이 팔린 아이스크림 맛 찾기
let mostSoldFlavor = Object.keys(flavorDistribution).reduce((a, b) => 
    flavorDistribution[a] > flavorDistribution[b] ? a : b
);

console.log(`The most sold flavor is ${mostSoldFlavor}`);
