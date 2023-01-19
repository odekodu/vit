import * as chai from "chai";
import { Repository } from "../../src/repository/repository.class";
import { Sample } from "../sample";
import { Commit } from "../../src/commit/commit.class";

const expect = chai.expect;
let repository: Repository<Sample>;
let commit: Commit;
const data: Sample = { name: 'Name', age: 20 };

describe('LastCommonAncestor (commit, commit)', () => {
    beforeEach(async () => {
        repository = await Repository.create<Sample>('Sample', {...data});
        repository.board = { ...data, name: 'Ken' };
        await repository.add();
        await repository.stage();
        commit = await Commit.create(repository, 'a commit', repository.head.commit as '') as Commit;
    });

    afterEach(() => repository.delete());

    it('should get the last common ancestor when commit is ancestor', async () => { 
        repository.board = { ...data, name: 'Toch' };
        await repository.add();
        await repository.stage();
        const _commit = await Commit.create(repository, 'another commit', commit._id as '') as Commit;       
        const ancestor = await commit.lastCommonAncestor(_commit);        
        expect(ancestor).deep.include({ _id: commit._id });
    });

    it('should get last common ancestor when both commits have the same ancestor', async () => { 
        repository.board = { ...data, name: 'Toch' };
        await repository.add();
        await repository.stage();
        const _commit = await Commit.create(repository, 'another commit', commit._id as '') as Commit; 
        
        repository.board = { ...data, name: 'ch' };
        await repository.add();
        await repository.stage();
        const __commit = await Commit.create(repository, 'another commit', commit._id as '') as Commit; 

        const ancestor = await _commit.lastCommonAncestor(__commit);        
        expect(ancestor).deep.include({ _id: commit._id });
    });

    it('should fail when commits are not related', async () => { 
        repository.board = { ...data, name: 'Toch' };
        await repository.add();
        await repository.stage();
        const _commit = await Commit.create(repository, 'another commit', '') as Commit; 

        const ancestor = await commit.lastCommonAncestor(_commit);        
        expect(ancestor).equal(undefined);
    });
});