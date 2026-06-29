"use client"

import RecentlyListedNFTs from "@/components/RecentlyListed";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Home() {
    const { isConnected, address } = useAccount()
    const [isApproved, setApproved] = useState(false);

    async function checkCompliance() {
        const response = await fetch("api/compliance", {
            method: "POST",
            body: JSON.stringify({
                address: address
            })
        });

        if (!response.ok) {
            setApproved(false);
        }

        const data = await response.json();
        console.log('Received compliance response 1 => ', response);
        console.log('Received compliance response 2 => ', data);
        console.log('Received compliance response 3 => ', data.data);
        console.log('Received compliance response 3 => ', data.data);

        if (data.success && data.isApproved) {
            setApproved(true);
        }
        else {
            setApproved(false);
        }
    }

    useEffect(() => {
        checkCompliance();
    }, [address])

    return (
        <main>
            {!isConnected ? (
                <div className="flex items-center justify-center p-4 md:p-6 xl:p-8">
                    Please connect a wallet
                </div>
            ) : (
                <div className="flex items-center justify-center p-4 md:p-6 xl:p-8">
                    {isApproved ?
                        <RecentlyListedNFTs />
                        :
                        <p>This address is not compliant</p>
                    }
                </div>
            )}
        </main>
    )
}
