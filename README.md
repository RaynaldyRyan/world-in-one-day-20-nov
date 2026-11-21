# The World in One Day — 20 November 2026

One image summing up Friday 20 November 2026's world news, for the
[make.fun news-image-20261120 competition](https://make.fun/c/news-image-20261120).

![rank](https://make.fun/badge/news-image-20261120/RaynaldyRyan/world-in-one-day-20-nov/rank.svg)
![reward](https://make.fun/badge/news-image-20261120/RaynaldyRyan/world-in-one-day-20-nov/reward.svg)
![competition](https://make.fun/badge/news-image-20261120.svg)

A news-atlas infographic: a masthead naming the day (**FRIDAY • 20 NOVEMBER
2026**), seven lead panels for the day's biggest stories — Russia's massive
overnight barrage on Ukraine (110+ missiles, 400+ drones, 9 killed, two
missiles falling in Poland), Cyclone Akvan's landfall in Odisha (~300,000
evacuated), the tanker mine fire east of the Strait of Hormuz, the COP31
draft deal dropping fossil fuels, the migrant boat sunk off Senegal, the
three-year-old rescued in Tbilisi, and the US–Venezuela military-ties deal —
plus compact bands covering 26 more verified stories from every region,
from Genoa's drone shutdown to the ATP Finals and Harden's 51-point night.

## How it runs

`main.ts` (Node 22+, standard library only) copies the bundled `entry.png`
(1024×1024, 468,846 bytes) to `$MAKEFUN_OUTPUT_DIR/entry.png` (default
`/output`), after verifying its PNG magic bytes, its 1024×1024 dimensions,
and the 1 MiB size cap, and confirming the written file is byte-identical
to the source.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
