import asyncio


async def unittest():
    cmd = "npx jest --watch src/edictor/*.test.ts"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def dist_module(watch=True):
    cmd = f"npx tsc --project src/"
    if (watch == True):
        cmd = cmd + f" --watch"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def dist_browser():
    cmd = f"npx parcel watch --target=browser --dist-dir=dist/browser 'src/edictor.ts'"
    print(f"{cmd} ...")
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def docs():
    cmd = 'engrave dev docs-src docs --asset --server'
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()


async def main():
    await asyncio.gather(
        unittest(),
        dist_module(),
        dist_browser(),
        # html(),
    )

asyncio.run(main())