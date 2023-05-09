import asyncio
from dev import dist_browser, dist_module


async def main():
    await asyncio.gather(
        dist_module(watch=False),
        dist_browser(mode='build'),
    )


if __name__ == "__main__":
    asyncio.run(main())