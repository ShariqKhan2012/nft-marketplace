import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request): Promise<Response> {
  try {
    const { address } = await request.json();
    console.log('Received compliance request 1 => ', address)
    if (!address) {
      console.log('Received compliance request 2 => ')
      return Response.json({
        error: true,
        message: "Address shoulld not be empty"
      });
    }
    console.log('Received compliance request 3 => ')

    const isComplianceCheckEnabled = process.env.ENABLE_COMPLIANCE_CHECK && process.env.ENABLE_COMPLIANCE_CHECK === 'true'
    console.log('Received compliance request 4 => ')
    if (!isComplianceCheckEnabled) {
      console.log('Received compliance request 5')
      return Response.json({
        success: true,
        isApproved: true,
        data: {
          result: "APPROVED",
          message: "Compliance checking is disabled"
        }
      })
    }
console.log('Received compliance request 6')
    const circleApiKey = process.env.CIRCLE_API_KEY
    console.log('Received compliance request 7')
    if (!circleApiKey) {
      return Response.json({
        error: true,
        message: "Circle API Key Not found"
      })
    }
console.log('Received compliance request 8')
    const idempotencyKey = uuidv4();

    const response = await fetch('https://api.circle.com/v1/w3s/compliance/screening/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${circleApiKey}`,
      },
      body: JSON.stringify({
        'chain': 'ETH-SEPOLIA',
        'address': address,
        'idempotencyKey': idempotencyKey
      })
    })
    console.log('Received compliance request 9')

    const data = await response.json();
    console.log('Received response from circle => ', data)
    const isApproved = data?.data?.result === 'APPROVED';

    return Response.json({
      success: true,
      isApproved: isApproved,
      data: data?.data
    })


  } catch (error) {
    console.log('Received compliance request 11 => ', error)
    return Response.json(
      { success: false, message: "Failed to process compliance check" },
      { status: 500 })
  }
}