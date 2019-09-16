class Prism {
    constructor(props) {
        const settings = Object.assign(
            {},
            {
                width: 1,
                height: 1,
                depth: 1,
            },
            props
        );

        const positions = [
            // Front face
            -0.5,
            -0.5,
            +0.5, // 0
            +0.5,
            -0.5,
            +0.5, // 1
            +0.5,
            +0.5,
            -0.5, // 2
            -0.5,
            +0.5,
            -0.5, // 3

            // back
            +0.5,
            -0.5,
            -0.5, // 4
            -0.5,
            -0.5,
            -0.5, // 5
        ];

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 0] *= settings.width;
            positions[i + 1] *= settings.height;
            positions[i + 2] *= settings.depth;
        }

        const indices = [
            // Front face
            0,
            1,
            2,
            0,
            2,
            3,
            // Back face
            4,
            3,
            2,
            4,
            5,
            3,
            // bottom
            1,
            0,
            5,
            1,
            5,
            4,
            // left
            5,
            0,
            3,
            // right
            1,
            4,
            2,
        ];

        return {
            positions,
            indices,
        };
    }
}

export default Prism;
