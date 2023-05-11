import asyncio
from dev import dist_module


async def main():
    await asyncio.gather(
        dist_module(mode='build'),
    )


if __name__ == "__main__":
    asyncio.run(main())