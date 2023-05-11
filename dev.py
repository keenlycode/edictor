import asyncio


async def unittest():
    cmd = "npx jest --watch src/edictor/*.test.ts"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def dist(mode='watch'):
    cmd = f"npm run {mode}"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def main():
    await asyncio.gather(
        unittest(),
        dist(),
    )

if __name__ == "__main__":
    asyncio.run(main())