<?php

namespace AppBundle\Repository;
use AppBundle\Entity\User;

/**
 * EntityRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class EntityRepository extends \Doctrine\ORM\EntityRepository
{
    /**
     * Get all for json.
     *
     * @return array
     */
    public function getAllForJson()
    {
        $all_entities = $this->getEntityManager()->getRepository('AppBundle:Entity')->findBy(array(), array('title' => 'ASC'));
        $ret = array();
        foreach ($all_entities as $entity) {
            $ret[] = array(
                'id' => $entity->getId(),
                'text' => $entity->getTitle(),
            );
        }
        return $ret;
    }


    public function getAllEntitiesForUser(User $user)
    {
        if ($user->hasAdminRights() || $user->hasManagementRights()) {
            return $this->getAllForJson();
        }
        $innovations_ids = $this->getEntityManager()->getRepository('AppBundle:Innovation')->getAllInnovationsIdsForUser($user);
        if(count($innovations_ids) == 0){ // First user innovation, we give him all entities
            return $this->getAllForJson();
        }
        $queryBuilder = $this->getEntityManager()->createQueryBuilder();
        $query = $queryBuilder->select(
            'DISTINCT(IDENTITY(i.entity))'
        )->from('AppBundle:Innovation', 'i')
            ->leftJoin('i.entity', 'entity')
            ->where('i.is_active = :is_active')
            ->andWhere('i.id in (:innovation_ids)')
            ->setParameters(array(
            'is_active' => true,
            'innovation_ids' => $innovations_ids
        ));
        $entities_ids = array();
        foreach ($query->getQuery()->getArrayResult() as $item){
            $entities_ids[] = $item[1];
        }
        $all_entities = $this->getEntityManager()->getRepository('AppBundle:Entity')->findBy(array('id' => $entities_ids), array('title' => 'ASC'));
        $ret = array();
        foreach ($all_entities as $entity) {
            $ret[] = array(
                'id' => $entity->getId(),
                'text' => $entity->getTitle(),
            );
        }
        return $ret;
    }
}
