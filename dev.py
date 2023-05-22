import asyncio


async def test():
    cmd = "npm run test-watch"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def dist():
    cmd = f"npm run build-watch"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def main():
    await asyncio.gather(
        test(),
        dist(),
    )

if __name__ == "__main__":
    asyncio.run(main())