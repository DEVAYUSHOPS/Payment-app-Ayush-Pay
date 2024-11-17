import { useEffect, useState } from "react"
import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"
import axios from "axios"

export const Dashboard = () => {

    const [balance,setBalance] = useState(0);
    const token = localStorage.getItem("token");

    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/account/balance",
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        )
            .then(response => {
                console.log(balance);
                setBalance(response.data.balance)
            })
    },[])

    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={balance} />
            <Users />
        </div>
    </div>
}