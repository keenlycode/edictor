import asyncio
from dev import dist


async def main():
    await asyncio.gather(
        dist(mode='build'),
    )


if __name__ == "__main__":
    asyncio.run(main())