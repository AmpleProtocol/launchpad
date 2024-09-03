#!/bin/bash
# set -e && RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release && mkdir -p ../out && cp target/wasm32-unknown-unknown/release/*.wasm ../out/series.wasm

rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release

# optimize using wasm-opt (binaryen)
wasm-opt -Oz ./target/wasm32-unknown-unknown/release/series.wasm -o ./target/wasm32-unknown-unknown/release/series.optimized.wasm
