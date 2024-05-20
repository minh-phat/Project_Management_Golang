// import { get } from "svelte/store";
// import { userStore } from "$lib/stores/userStore.js";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080";
axios.interceptors.request.use(
    (config) => {
        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
let employees = [];
await axios
    .get("/employee-get-all")
    .then((response) => {
        // Handle the response data here
        employees = response.data.employees; // Assign the fetched JSON data to the jsonData variable
    })
    .catch((err) => {
        console.error(err);
    });
 
//add data to create chart
let employeeDataInChart = employees.map((item) => ({
    createdAt: new Date(item.createdAt), // Lấy trường fullname từ mảng thứ nhất
}));
//Sort employee ascending by date
employeeDataInChart = employeeDataInChart.sort((a, b) => a.createdAt - b.createdAt);
console.log("employeeDataInChart0",employeeDataInChart)
//count the number of accounts created
employeeDataInChart = employeeDataInChart.map((item, index) => ({
    createdAt: item.createdAt, // Lấy trường fullname từ mảng thứ nhất
    group: "employee",
    value: index + 1,
}));
console.log("employeeDataInChart2",employeeDataInChart)


export {employeeDataInChart};
