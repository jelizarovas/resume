import skills from "../api/skills.json";
import { Section } from "./Section";


export const Skills = () => {
  return (
    <Section title="Skills">
      <div className="flex flex-col sm:flex-row print:flex-row justify-evenly">
        {skills.map((skill, i) => (
          <Skill key={i} skill={skill} />
        ))}
      </div>
    </Section>
  );
};

type SkillProps = {
    name: string
}


const Skill = ({skill} : {skill: SkillProps}) => {
  return (
    <div className="jobDiv flex flex-col w-1/2 mx-2  py-2 group">
     {skill.name}
    </div>
  );
};
