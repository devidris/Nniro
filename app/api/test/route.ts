const handlers = {
  POST: async (req: Request) => {
    const log = await req.json()
    console.log('log: ', log)
    return Response.json({ test: true })
  }
}

export const { POST } = handlers