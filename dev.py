import asyncio


async def unittest():
    cmd = "npx jest --watch src/edictor/*.test.ts"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def dist_module(mode='watch'):
    cmd = f"npx parcel {mode} --target=module 'src/edictor.ts'"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def main():
    await asyncio.gather(
        unittest(),
        dist_module(),
    )

if __name__ == "__main__":
    asyncio.run(main())