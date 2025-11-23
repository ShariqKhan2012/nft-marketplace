import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import NFTBox from "./NFTBox"
import Link from "next/link"

interface NFTItem {
    rIndexerId: string,
    network: string,
    nftAddress: string,
    seller: string,
    price: string,
    tokenId: string,
    txHash: string,
    contractAddress: string,
    blocknumber: string,
}

interface NFTBoughtCancelled {
    nftAddress: string,
    tokenId: string,
}

interface NFTQueryResponse {
    data: {
        allItemListeds: {
            nodes: NFTItem[]
        }
        allItemCanceleds: {
            nodes: NFTBoughtCancelled[]
        }
        allItemBoughts: {
            nodes: NFTBoughtCancelled[]
        }
    }
}
const RECENTLY_LISTED_NFTS_QUERY = `
query Query {
  allItemListeds(first: 20, orderBy: BLOCK_NUMBER_DESC) {
    nodes {
      network
      nftAddress
      seller
      price
      tokenId
      txHash
      contractAddress
    }
  }
  allItemCanceleds {
    nodes {
      nftAddress
      tokenId
    }
  }
  allItemBoughts {
    nodes {
      nftAddress
      tokenId
    }
  }
}
`

async function fetchRecetlyListedNFTs(): Promise<NFTQueryResponse> {
    const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: RECENTLY_LISTED_NFTS_QUERY
        })
    })

    if (!response.ok) {
        throw new Error("There was a problem fetching the NFTs");
    }
    return response.json()
}

function useRecentlyListedNFTs() {
    const { data, isLoading, error } = useQuery<NFTQueryResponse>({
        queryKey: ['recentNFTs'],
        queryFn: fetchRecetlyListedNFTs
    })

    const nftDataList = useMemo(() => {
        if (!data) {
            return []
        }
        const boughtNFTs = new Set<string>();
        const cancelledNFTs = new Set<string>();

        data.data.allItemBoughts.nodes.forEach((item) => {
            if (item.nftAddress && item.tokenId) {
                boughtNFTs.add(`${item.nftAddress}-${item.tokenId}`);
            }
        })
        data.data.allItemCanceleds.nodes.forEach((item) => {
            if (item.nftAddress && item.tokenId) {
                cancelledNFTs.add(`${item.nftAddress}-${item.tokenId}`);
            }
        })

        const availableNFTs = data.data.allItemListeds.nodes.filter((item) => {
            if (!item.nftAddress || !item.tokenId) {
                return false;
            }
            const key = `${item.nftAddress}-${item.tokenId}`;
            return !boughtNFTs.has(key) && !cancelledNFTs.has(key);
        })

        const recentNFTs = availableNFTs.slice(0, 20);
        return recentNFTs.map(nft => ({
            tokenId: nft.tokenId,
            contractAddress: nft.nftAddress,
            price: nft.price,
        }))
    }, [data])
    return { isLoading, error, nftDataList };
}

// Main component that uses the custom hook
export default function RecentlyListedNFTs() {
    const { isLoading, error, nftDataList } = useRecentlyListedNFTs();
    console.log("Recently Listed NFTs:", nftDataList);
    if (isLoading) {
        return <div>Loading...</div>
    }
    if (error) {
        return <div>Error...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mt-8 text-center">
                <Link
                    href="/list-nft"
                    className="inline-block py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    List Your NFT
                </Link>
            </div>
            <h2 className="text-2xl font-bold mb-6">Recently Listed NFTs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {nftDataList.map((nft, index) => (
                    <Link key={index} href={`/buy-nft/${nft.contractAddress}/${nft.tokenId}`}>
                        <NFTBox tokenId={nft.tokenId} price={nft.price} contractAddress={nft.contractAddress} />
                    </Link>
                ))}
            </div>
        </div>
    )
}
