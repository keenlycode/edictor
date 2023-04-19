import asyncio


async def dist():
    cmd = 'npx tsc -p src/'
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()


async def main():
    await asyncio.gather(
        dist(),
    )

asyncio.run(main())