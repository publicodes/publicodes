declare module './packages.yaml' {
    const packages: Package[];
    export default packages;
}

export type Packages = {
    npm: string;
    maintainer: string;
    users: string[];
};
