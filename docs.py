import asyncio


async def docs_html():
    cmd = 'engrave dev docs-src docs --asset --server'
    print(f'{cmd} ...')
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def docs_javascript():
    cmd = f"npm run docs-watch"
    print(f"{cmd} ...")
    proc = await asyncio.create_subprocess_shell(cmd)
    await proc.communicate()

async def main():
    await asyncio.gather(
        docs_html(),
        docs_javascript(),
    )

if __name__ == "__main__":
    asyncio.run(main())