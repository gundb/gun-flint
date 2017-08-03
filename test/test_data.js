exports.default = {
    get: {
        fullNode: {
            '#': 'full_node_dedup',
            get: {
                '#': 'node1'
            }
        },
        field: {
            '#': 'field_dedup',
            get: {
                '#': 'node2',
                '.': 'prop2'
            }
        }
    },
    put: {
        gun: {},
        '@': 'dedup_get',
        '#': 'dedup_put',
        put: {
            node1: {
                '_': {
                    '#': 'node1',
                    '>': {
                        prop1: 12345678910,
                        prop2: 12345678910
                    }
                },
                prop1: 'prop1',
                prop2: 'prop2'
            },
            node2: {
                '_': {
                    '#': 'node2',
                    '>': {
                        prop2: 12345678910
                    }
                },
                prop2: 'prop2'
            }
        }
    },
    union: {
        node1: {
            '_': {
                '#': 'node1',
                '>': {
                    prop3: 12345678910,
                    prop4: 12345678910
                }
            },
            prop3: 'prop3',
            prop4: 'prop4'
        },
        node2: {
            '_': {
                '#': 'node2',
                '>': {
                    prop3: 12345678910,
                }
            },
            prop3: 'prop3'
        }
    }
}