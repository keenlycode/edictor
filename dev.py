import asyncio


async def typescript():
    cmd = "npx parcel watch --target test 'test-src/**/*.ts'"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def html():
    cmd = 'engrave dev test-src test-html --asset --server'
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()


async def main():
    await asyncio.gather(
        typescript(),
        html(),
    )

asyncio.run(main())