import asyncio


async def build():
    cmd = f"npm run build"
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()


async def main():
    await asyncio.gather(
        build(),
    )


if __name__ == "__main__":
    asyncio.run(main())