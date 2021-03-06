<?php

namespace AppBundle\Repository;

use AppBundle\Entity\Settings;
use AppBundle\Entity\Skill;

/**
 * SkillRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class SkillRepository extends \Doctrine\ORM\EntityRepository
{

    /**
     * Get main skills
     *
     * @param boolean $to_select2_array
     * @return array
     */
    public function getMainSkills($to_select2_array = false){
        $skills = $this->findBy(['is_main_skill' => true]);
        if($to_select2_array){
            $ret = array();
            foreach ($skills as $skill){
                $ret[] = $skill->toSelect2Array();
            }
            return $ret;
        }
        return $skills;
    }


    /**
     * Get or create skill.
     *
     * @param $title
     * @return Skill|bool|object|null
     * @throws \Doctrine\ORM\ORMException
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function getOrCreateSkill($title){
        if(!$title){
            return false;
        }
        $em = $this->getEntityManager();
        if(is_numeric($title)){
            $skill = $this->findOneBy(['id' => $title]);
        }else{
            $skill = $this->findOneBy(['title' => $title]);
        }
        if (!$skill) {
            $skill = new Skill();
            $skill->setTitle(Settings::getXssCleanString($title));
            $em->persist($skill);
            $em->flush();
        }
        return $skill;
    }


    /**
     * Search Skill by title.
     *
     * @param $title
     * @param boolean $to_select2_array
     * @param int $offset
     * @param int $limit
     * @return array|mixed
     */
    public function searchSkillByTitle($title, $to_select2_array = false, $offset = 0, $limit = 20){
        $qb = $this->_em->createQueryBuilder();
        $qb->select('t')
            ->from('AppBundle:Skill', 't');
        $qb->addSelect("(CASE WHEN t.title like :search_first THEN 2 WHEN t.title like :global_search THEN 1 ELSE 0 END) AS HIDDEN ORD ");
        $qb->where('t.title LIKE :title');
        $qb->setParameter('title', '%' . $title . '%');
        $qb->setParameter('search_first', $title . '%');
        $qb->setParameter('global_search', '%' . $title . '%');
        $qb->setFirstResult($offset);
        $qb->setMaxResults($limit);
        $qb->orderBy('ORD', 'DESC');
        $skills = $qb->getQuery()
            ->getResult();
        if($to_select2_array){
            $ret = array();
            foreach ($skills as $skill){
                $ret[] = $skill->toSelect2Array();
            }
            return $ret;
        }
        return $skills;
    }
}
