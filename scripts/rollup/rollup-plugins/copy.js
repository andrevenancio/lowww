import fse from 'fse';

export default function replace(files) {
    return {
        name: 'copy',

        onwrite() {
            files.forEach((file) => {
                if (file.isFile) {
                    fse.copyFile(file.from, file.to);
                } else {
                    fse.copydir(file.from, file.to);
                }
            });
        },
    };
}
