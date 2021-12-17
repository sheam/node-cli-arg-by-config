import typescript from "rollup-plugin-typescript2";
import { typescriptPaths } from 'rollup-plugin-typescript-paths';
import pkg from "./package.json";

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'es',
        },
    ],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
        typescriptPaths(),
        typescript({
            typescript: require('typescript'),
        }),
    ],
}
