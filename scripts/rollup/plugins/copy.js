import fse from 'fs-extra';

export default function replace(files) {
    return {
        name: 'copy',

        onwrite() {
            files.forEach((file) => {
                fse.copy(file.from, file.to).then(() => {
                }).catch((e) => {
                    console.log('ERROR', e);
                });
            });
        },
    };
}
