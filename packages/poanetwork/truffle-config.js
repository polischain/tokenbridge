module.exports = {
    contracts_build_directory: './build/contracts',
    networks: {},
    compilers: {
        solc: {
            version: '0.4.24',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
            },
        },
    },
}