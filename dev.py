import asyncio


async def test_typescript():
    cmd = "npx parcel watch --no-cache --target test 'test-src/**/*.ts'"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def test_javascript():
    cmd = "npx parcel watch --target test 'test-src/**/*.js'"
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
        test_typescript(),
        # test_javascript(),
        html(),
    )

asyncio.run(main())