import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
})


export async function fetchResolutions(url: string) {
    const response = await axiosInstance.post(`/api/resolutions?url=${url}`)
    return response.data
}

export async function startDownload(url: string, resolution: string) {
    const response = await axiosInstance.post(`/api/download?url=${url}&resolution=${resolution}`, {}, {
        responseType: 'blob'
    });

    if (response.status !== 200) {
        throw new Error(response.statusText);
    }

    return response.data;
}

// export async function createOrder() {
//     const response = await axiosInstance.post("/api/payment/create")
//     return response.data
// }

// export async function startPayment(url: string) {
//     const response = await axiosInstance.post(`/api/resolutions?url=${url}`)
//     return response.data
// }
