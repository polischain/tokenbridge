module.exports = {
    contracts_build_directory: './build/contracts',
    networks: {},
    compilers: {
        solc: {
            version: '0.7.5',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },
    },
}