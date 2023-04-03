import asyncio


async def dist():
    cmd = 'npx parcel build --target module src/**/*.{ts,js}'
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()


async def main():
    await asyncio.gather(
        dist(),
    )

asyncio.run(main())